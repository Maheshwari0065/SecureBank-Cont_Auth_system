import pyodbc
from config import Config
from werkzeug.security import generate_password_hash, check_password_hash
import random
import time

def get_db_connection(db_name=True):
    # Depending on driver installed, handle appropriately
    drivers = [x for x in pyodbc.drivers() if 'SQL Server' in x]
    driver = '{ODBC Driver 17 for SQL Server}' if 'ODBC Driver 17 for SQL Server' in drivers else ('{SQL Server Native Client 11.0}' if 'SQL Server Native Client 11.0' in drivers else '{SQL Server}')
    
    if db_name:
        conn_str = f"DRIVER={driver};SERVER={Config.MSSQL_SERVER};DATABASE={Config.MSSQL_DB};Trusted_Connection=yes;"
    else:
        conn_str = f"DRIVER={driver};SERVER={Config.MSSQL_SERVER};Trusted_Connection=yes;"
    
    conn = pyodbc.connect(conn_str, autocommit=True)
    return conn

def init_db():
    try:
        conn = get_db_connection(db_name=False)
        cursor = conn.cursor()
        cursor.execute(f"IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '{Config.MSSQL_DB}') CREATE DATABASE {Config.MSSQL_DB}")
        time.sleep(1) # Give it a second to create
        conn.close()
    except Exception as e:
        print(f"Database creation check failed (skip if exists): {e}")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    tables = """
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' and xtype='U')
    CREATE TABLE users (
        id INT PRIMARY KEY IDENTITY(1,1),
        full_name NVARCHAR(100) NOT NULL,
        username NVARCHAR(100) UNIQUE NOT NULL,
        email NVARCHAR(150) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        account_number NVARCHAR(20) UNIQUE,
        is_trained BIT DEFAULT 0,
        model_path NVARCHAR(255),
        scaler_path NVARCHAR(255),
        trained_at DATETIME NULL,
        created_at DATETIME DEFAULT GETDATE()
    );

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='verifications' and xtype='U')
    CREATE TABLE verifications (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT FOREIGN KEY REFERENCES users(id),
        anomaly_ratio FLOAT,
        status NVARCHAR(20),
        vectors_analyzed INT,
        verified_at DATETIME DEFAULT GETDATE()
    );

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='transactions' and xtype='U')
    CREATE TABLE transactions (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT FOREIGN KEY REFERENCES users(id),
        description NVARCHAR(200),
        amount FLOAT,
        type NVARCHAR(10),
        date DATETIME DEFAULT GETDATE()
    );
    """
    try:
        cursor.execute(tables)
    except Exception as e:
        print(f"Error creating tables: {e}")
    finally:
        conn.close()

def create_user(full_name, username, email, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    acc_num = "SB" + "".join([str(random.randint(0, 9)) for _ in range(10)])
    pwd_hash = generate_password_hash(password)
    
    try:
        cursor.execute('''
            INSERT INTO users (full_name, username, email, password_hash, account_number)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?, ?)
        ''', (full_name, username, email, pwd_hash, acc_num))
        user_id = cursor.fetchone()[0]
        
        fake_txns = [
            ("Salary Credit", 45000.0, "Credit"),
            ("Amazon Purchase", 1299.0, "Debit"),
            ("Electricity Bill", 850.0, "Debit"),
            ("UPI Transfer", 2500.0, "Debit"),
            ("Interest Credit", 312.0, "Credit")
        ]
        
        for desc, amt, t_type in fake_txns:
            cursor.execute('''
                INSERT INTO transactions (user_id, description, amount, type)
                VALUES (?, ?, ?, ?)
            ''', (user_id, desc, amt, t_type))
            
        return True, "User registered successfully", acc_num
    except pyodbc.IntegrityError:
        return False, "Username or Email already exists", None
    except Exception as e:
        return False, str(e), None
    finally:
        conn.close()

def authenticate_user(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, username, full_name, account_number, password_hash, is_trained 
        FROM users WHERE username = ?
    ''', (username,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row and check_password_hash(row[4], password):
        return {
            'user_id': row[0],
            'username': row[1],
            'full_name': row[2],
            'account_number': row[3],
            'is_trained': bool(row[5])
        }
    return None

def update_user_training(user_id, is_trained, model_path, scaler_path):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE users 
        SET is_trained = ?, model_path = ?, scaler_path = ?, trained_at = GETDATE()
        WHERE id = ?
    ''', (1 if is_trained else 0, model_path, scaler_path, user_id))
    conn.close()

def log_verification(user_id, anomaly_ratio, status, vectors):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO verifications (user_id, anomaly_ratio, status, vectors_analyzed)
        VALUES (?, ?, ?, ?)
    ''', (user_id, anomaly_ratio, status, vectors))
    conn.close()

def get_transactions(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT date, description, amount, type
        FROM transactions WHERE user_id = ?
        ORDER BY date DESC
    ''', (user_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "date": row[0].strftime("%d %b"),
            "description": row[1],
            "amount": row[2],
            "type": row[3]
        }
        for row in rows
    ]

def create_transfer_transaction(user_id, to_account, amount, note):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        desc = f"Transfer to {to_account}"
        if note:
            desc += f" - {note}"
            
        cursor.execute('''
            INSERT INTO transactions (user_id, description, amount, type)
            VALUES (?, ?, ?, ?)
        ''', (user_id, desc, float(amount), "Debit"))
        
        cursor.execute("SELECT @@IDENTITY")
        tx_id = cursor.fetchone()[0]
        return True, tx_id
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def get_account_balances(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END) - 
               SUM(CASE WHEN type = 'Debit' THEN amount ELSE 0 END) as balance
        FROM transactions WHERE user_id = ?
    ''', (user_id,))
    
    row = cursor.fetchone()
    current_balance = row[0] if row[0] is not None else 0.0
    
    cursor.execute('SELECT account_number FROM users WHERE id = ?', (user_id,))
    acc_row = cursor.fetchone()
    account_number = acc_row[0] if acc_row else "Unknown"
    
    conn.close()
    
    return {
        "savings_balance": 124500.00,
        "current_balance": float(current_balance),
        "fd_balance": 200000.00,
        "account_number": account_number,
        "ifsc": "SBIN0001234",
        "branch": "Main Branch"
    }
