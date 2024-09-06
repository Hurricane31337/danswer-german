from typing import cast

from backend.danswer.configs.constants import KV_USER_STORE_KEY
from backend.danswer.dynamic_configs.factory import get_dynamic_config_store
from backend.danswer.dynamic_configs.interface import ConfigNotFoundError
from backend.danswer.dynamic_configs.interface import JSON_ro


def get_invited_users() -> list[str]:
    try:
        store = get_dynamic_config_store()
        return cast(list, store.load(KV_USER_STORE_KEY))
    except ConfigNotFoundError:
        return list()


def write_invited_users(emails: list[str]) -> int:
    store = get_dynamic_config_store()
    store.store(KV_USER_STORE_KEY, cast(JSON_ro, emails))
    return len(emails)
