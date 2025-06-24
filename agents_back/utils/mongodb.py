

def mongo_document_to_type(dict: dict, type):
    dict["id"] = dict.pop("_id")
    return type(**dict)