import logging
from neo4j import AsyncGraphDatabase, AsyncDriver
from app.core.config import settings

logger = logging.getLogger("insureguard.neo4j")

class Neo4jManager:
    def __init__(self):
        self._driver: AsyncDriver | None = None

    async def connect(self):
        if not self._driver:
            try:
                self._driver = AsyncGraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
                )
                logger.info("Connected to Neo4j Graph Database.")
            except Exception as e:
                logger.warning(f"Neo4j connection could not be established: {e}")

    async def close(self):
        if self._driver:
            await self._driver.close()
            self._driver = None
            logger.info("Closed Neo4j Graph Database connection.")

    async def execute_query(self, query: str, parameters: dict = None):
        if not self._driver:
            await self.connect()
        if not self._driver:
            return []
        async with self._driver.session() as session:
            result = await session.run(query, parameters or {})
            return [record.data() async for record in result]

neo4j_client = Neo4jManager()
