import os
from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app)


app.config["MONGO_URI"] = os.getenv("MONGO_URI")


mongo = PyMongo(app)



todos_collection = mongo.db.todos


def serialize_todo(todo):
    todo["_id"] = str(todo["_id"])
    return todo



@app.route("/api/todos", methods=['GET'])
def get_todos():
    try:
        all_todos = todos_collection.find().sort("_id", -1)
        result = [serialize_todo(todo) for todo in all_todos]
        return jsonify(result)
    except Exception as e:
        
        return jsonify({"message": f"Lỗi máy chủ hoặc kết nối database: {e}"}), 500


@app.route("/api/todos", methods=['POST'])
def create_todo():
    
    text = request.json.get('text')
    
    if not text:
        return jsonify({"message": "Thiếu trường 'text'"}), 400

    new_todo = {
        "text": text,
        "completed": False
    }
    
    result = todos_collection.insert_one(new_todo)
    
    
    created_todo = todos_collection.find_one({"_id": result.inserted_id})
    
    if not created_todo:
        return jsonify({"message": "Lỗi khi tạo: không tìm thấy bản ghi vừa tạo"}), 500
        
    return jsonify(serialize_todo(created_todo)), 201


@app.route("/api/todos/<id>", methods=['PUT'])
def update_todo(id):
   
    try:
        todo = todos_collection.find_one({"_id": ObjectId(id)})
        
        if not todo:
            return jsonify({"message": "Không tìm thấy công việc"}), 404

        new_completed_status = not todo.get("completed", False)
        
        todos_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"completed": new_completed_status}}
        )
        
        updated_todo = todos_collection.find_one({"_id": ObjectId(id)})
        return jsonify(serialize_todo(updated_todo))
    except Exception as e:
        
        return jsonify({"message": f"Lỗi: ID không hợp lệ. {str(e)}"}), 400

# --- DELETE ---
@app.route("/api/todos/<id>", methods=['DELETE'])
def delete_todo(id):
    try:
        result = todos_collection.delete_one({"_id": ObjectId(id)})
        
        if result.deleted_count == 1:
            return jsonify({"message": "Đã xóa công việc"}), 200
        else:
            return jsonify({"message": "Không tìm thấy công việc"}), 404
    except Exception as e:
        return jsonify({"message": f"Lỗi: ID không hợp lệ. {str(e)}"}), 400


if __name__ == "__main__":
    app.run(port=5000, debug=True)