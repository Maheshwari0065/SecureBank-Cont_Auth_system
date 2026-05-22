import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-123'
    MSSQL_SERVER = os.environ.get('MSSQL_SERVER', '.\\MSSQLSERVER01') 
    MSSQL_DB = os.environ.get('MSSQL_DB', 'Cont_auth_db')
    
    # Try different drivers, fallback to older ones
    try:
        MSSQL_CONNECTION_STRING = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={MSSQL_SERVER};DATABASE={MSSQL_DB};Trusted_Connection=yes;"
    except:
        MSSQL_CONNECTION_STRING = f"DRIVER={{SQL Server}};SERVER={MSSQL_SERVER};DATABASE={MSSQL_DB};Trusted_Connection=yes;"
        
    JWT_SECRET = os.environ.get('JWT_SECRET') or 'jwt-secret-key-456'
    MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models_dir')
