import asyncio
import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database.mongodb import connect_to_mongo, close_mongo_connection
from backend.app.services.seed_data import seed_initial_data

async def main():
    print("[INFO] Starting RIT Master Database Seeding...")
    await connect_to_mongo()
    await seed_initial_data()
    await close_mongo_connection()
    print("[SUCCESS] Master Database Seeding Completed Successfully!")

if __name__ == "__main__":
    asyncio.run(main())
