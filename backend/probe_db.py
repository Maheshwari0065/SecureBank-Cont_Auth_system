import pyodbc

def probe_instances():
    drivers = [x for x in pyodbc.drivers() if 'SQL Server' in x]
    if not drivers:
        print("No drivers")
        return
    
    driver = drivers[0]
    instances = [
        "(localdb)\\MSSQLLocalDB",
        "localhost",
        "(local)",
        ".\\SQLEXPRESS",
        "127.0.0.1"
    ]
    
    for inst in instances:
        print(f"Probing {inst}...")
        conn_str = f"DRIVER={{{driver}}};SERVER={inst};Trusted_Connection=yes;"
        try:
            conn = pyodbc.connect(conn_str, timeout=2)
            print(f"✅ SUCCESS on {inst}!")
            conn.close()
            return inst
        except Exception as e:
            print(f"❌ Failed {inst}")
    return None

if __name__ == "__main__":
    probe_instances()
