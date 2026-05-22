import pyodbc
import sys
import os

# Import config from backend folder
sys.path.append(os.getcwd())
from config import Config

def test_connection():
    driver = '{ODBC Driver 17 for SQL Server}'
    drivers = [x for x in pyodbc.drivers() if 'SQL Server' in x]
    print(f"Available Drivers: {drivers}")
    
    if not drivers:
        print("❌ ERROR: No SQL Server ODBC drivers found. Re-install ODBC Driver 17.")
        return

    # Try to find a working driver from available ones
    working_driver = drivers[0]
    conn_str = f"DRIVER={{{working_driver}}};SERVER={Config.MSSQL_SERVER};Trusted_Connection=yes;"
    
    print(f"Attempting connection to: {Config.MSSQL_SERVER}")
    try:
        conn = pyodbc.connect(conn_str, timeout=5)
        print("✅ SUCCESS: Connected to SQL Server!")
        
        cursor = conn.cursor()
        cursor.execute("SELECT @@version")
        row = cursor.fetchone()
        print(f"SQL Server Version: {row[0]}")
        
        conn.close()
    except Exception as e:
        print(f"❌ FAILED to connect: {e}")

if __name__ == "__main__":
    test_connection()
