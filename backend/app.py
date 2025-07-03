from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Hunt, HuntLog, HuntNode
from semantic_clustering import get_clusterer
import json
import os
from datetime import datetime

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hunts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
CORS(app)

# Create tables
with app.app_context():
    db.create_all()

# Hunt Routes
@app.route('/api/hunts', methods=['GET'])
def get_hunts():
    hunts = Hunt.query.all()
    return jsonify([hunt.to_dict() for hunt in hunts])

@app.route('/api/hunts', methods=['POST'])
def create_hunt():
    data = request.get_json()
    
    hunt = Hunt(
        name=data.get('name'),
        terrain=data.get('terrain'),
        victory_conditions=data.get('victoryConditions'),
        failure_modes=data.get('failureModes'),
        duration=data.get('duration'),
        status=data.get('status', 'active')
    )
    
    db.session.add(hunt)
    db.session.commit()
    
    return jsonify(hunt.to_dict()), 201

@app.route('/api/hunts/<int:hunt_id>', methods=['GET'])
def get_hunt(hunt_id):
    hunt = Hunt.query.get_or_404(hunt_id)
    return jsonify(hunt.to_dict())

@app.route('/api/hunts/<int:hunt_id>', methods=['PUT'])
def update_hunt(hunt_id):
    hunt = Hunt.query.get_or_404(hunt_id)
    data = request.get_json()
    
    hunt.name = data.get('name', hunt.name)
    hunt.terrain = data.get('terrain', hunt.terrain)
    hunt.victory_conditions = data.get('victoryConditions', hunt.victory_conditions)
    hunt.failure_modes = data.get('failureModes', hunt.failure_modes)
    hunt.duration = data.get('duration', hunt.duration)
    hunt.status = data.get('status', hunt.status)
    hunt.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify(hunt.to_dict())

@app.route('/api/hunts/<int:hunt_id>', methods=['DELETE'])
def delete_hunt(hunt_id):
    hunt = Hunt.query.get_or_404(hunt_id)
    db.session.delete(hunt)
    db.session.commit()
    
    return '', 204

# Hunt Nodes Routes
@app.route('/api/hunts/<int:hunt_id>/nodes', methods=['GET'])
def get_hunt_nodes(hunt_id):
    nodes = HuntNode.query.filter_by(hunt_id=hunt_id).all()
    return jsonify([node.to_dict() for node in nodes])

@app.route('/api/hunts/<int:hunt_id>/nodes', methods=['POST'])
def create_hunt_node(hunt_id):
    # Verify hunt exists
    Hunt.query.get_or_404(hunt_id)
    
    data = request.get_json()
    
    # Get semantic positioning if requested
    use_semantic = data.get('use_semantic', True)
    x, y = data.get('x'), data.get('y')
    
    if use_semantic and data.get('text'):
        try:
            # Get existing nodes for this hunt
            existing_nodes = HuntNode.query.filter_by(hunt_id=hunt_id).all()
            existing_data = [node.to_dict() for node in existing_nodes]
            
            # Try to find semantic position
            clusterer = get_clusterer()
            semantic_pos = clusterer.find_best_cluster_position(
                data.get('text'), 
                existing_data
            )
            
            if semantic_pos:
                x, y = semantic_pos['x'], semantic_pos['y']
                print(f"Semantic positioning: similarity={semantic_pos['similarity']:.2f}")
        except Exception as e:
            print(f"Semantic positioning failed, using original position: {e}")
    
    node = HuntNode(
        hunt_id=hunt_id,
        x=x,
        y=y,
        width=data.get('width', 200),
        height=data.get('height', 50),
        text=data.get('text'),
        type=data.get('type', 'note'),
        connections=json.dumps(data.get('connections', []))
    )
    
    db.session.add(node)
    db.session.commit()
    
    return jsonify(node.to_dict()), 201

@app.route('/api/nodes/<int:node_id>', methods=['PUT'])
def update_hunt_node(node_id):
    node = HuntNode.query.get_or_404(node_id)
    data = request.get_json()
    
    node.x = data.get('x', node.x)
    node.y = data.get('y', node.y)
    node.width = data.get('width', node.width)
    node.height = data.get('height', node.height)
    node.text = data.get('text', node.text)
    node.type = data.get('type', node.type)
    node.connections = json.dumps(data.get('connections', json.loads(node.connections or '[]')))
    node.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify(node.to_dict())

@app.route('/api/nodes/<int:node_id>', methods=['DELETE'])
def delete_hunt_node(node_id):
    node = HuntNode.query.get_or_404(node_id)
    db.session.delete(node)
    db.session.commit()
    
    return '', 204

# Hunt Logs Routes
@app.route('/api/hunts/<int:hunt_id>/logs', methods=['GET'])
def get_hunt_logs(hunt_id):
    logs = HuntLog.query.filter_by(hunt_id=hunt_id).order_by(HuntLog.created_at.desc()).all()
    return jsonify([log.to_dict() for log in logs])

@app.route('/api/hunts/<int:hunt_id>/logs', methods=['POST'])
def create_hunt_log(hunt_id):
    # Verify hunt exists
    Hunt.query.get_or_404(hunt_id)
    
    data = request.get_json()
    
    log = HuntLog(
        hunt_id=hunt_id,
        week_number=data.get('weekNumber'),
        entry=data.get('entry'),
        breakthroughs=json.dumps(data.get('breakthroughs', [])),
        failed_approaches=json.dumps(data.get('failedApproaches', []))
    )
    
    db.session.add(log)
    db.session.commit()
    
    return jsonify(log.to_dict()), 201

@app.route('/api/logs/<int:log_id>', methods=['PUT'])
def update_hunt_log(log_id):
    log = HuntLog.query.get_or_404(log_id)
    data = request.get_json()
    
    log.week_number = data.get('weekNumber', log.week_number)
    log.entry = data.get('entry', log.entry)
    log.breakthroughs = json.dumps(data.get('breakthroughs', json.loads(log.breakthroughs or '[]')))
    log.failed_approaches = json.dumps(data.get('failedApproaches', json.loads(log.failed_approaches or '[]')))
    
    db.session.commit()
    
    return jsonify(log.to_dict())

@app.route('/api/logs/<int:log_id>', methods=['DELETE'])
def delete_hunt_log(log_id):
    log = HuntLog.query.get_or_404(log_id)
    db.session.delete(log)
    db.session.commit()
    
    return '', 204

# Semantic clustering endpoint
@app.route('/api/hunts/<int:hunt_id>/semantic-analysis', methods=['GET'])
def analyze_hunt_semantics(hunt_id):
    """Analyze semantic clusters in a hunt's nodes."""
    try:
        nodes = HuntNode.query.filter_by(hunt_id=hunt_id).all()
        node_data = [node.to_dict() for node in nodes]
        
        clusterer = get_clusterer()
        clusters = clusterer.cluster_existing_nodes(node_data)
        
        return jsonify({
            'clusters': clusters,
            'total_nodes': len(node_data),
            'clustered_nodes': sum(len(cluster['nodes']) for cluster in clusters)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)