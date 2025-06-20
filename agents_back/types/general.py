from bson import ObjectId as BsonObjectId
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema

class ObjectId(BsonObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler: GetCoreSchemaHandler):
        def validate_from_string(value: str) -> BsonObjectId:
            if not BsonObjectId.is_valid(value):
                raise ValueError("Invalid ObjectId string")
            return BsonObjectId(value)

        # This schema allows either a string that can be converted to ObjectId,
        # or an existing ObjectId instance.
        return core_schema.no_info_after_validator_function(
            cls,  # Use the class itself as the validator for the final type
            core_schema.union_schema([
                core_schema.is_instance_schema(BsonObjectId),  # Accept existing BsonObjectId instances directly
                core_schema.no_info_after_validator_function(
                    validate_from_string,
                    core_schema.str_schema()
                )
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(lambda x: str(x)),
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @staticmethod
    def generate():
        return BsonObjectId()