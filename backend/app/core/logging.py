import logging
import sys
from app.core.config import settings

def setup_logging():
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    # Custom formatter that does not log sensitive tokens
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Avoid duplicate handlers if setup_logging is called multiple times
    if not root_logger.handlers:
        root_logger.addHandler(handler)
    else:
        root_logger.handlers[0] = handler

    # Silence overly verbose external loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    return root_logger

logger = logging.getLogger("fraudshield")
