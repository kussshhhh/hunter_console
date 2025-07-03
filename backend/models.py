from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Hunt(db.Model):
    __tablename__ = 'hunts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    terrain = db.Column(db.Text)
    victory_conditions = db.Column(db.Text)
    failure_modes = db.Column(db.Text)
    duration = db.Column(db.String(100))
    status = db.Column(db.String(50), default='active')
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    logs = db.relationship('HuntLog', backref='hunt', lazy=True, cascade='all, delete-orphan')
    nodes = db.relationship('HuntNode', backref='hunt', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'terrain': self.terrain,
            'victoryConditions': self.victory_conditions,
            'failureModes': self.failure_modes,
            'duration': self.duration,
            'status': self.status,
            'startDate': self.start_date.isoformat() if self.start_date else None,
            'createdAt': int(self.created_at.timestamp() * 1000) if self.created_at else None,
            'updatedAt': int(self.updated_at.timestamp() * 1000) if self.updated_at else None
        }

class HuntLog(db.Model):
    __tablename__ = 'hunt_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    hunt_id = db.Column(db.Integer, db.ForeignKey('hunts.id'), nullable=False)
    week_number = db.Column(db.Integer)
    entry = db.Column(db.Text)
    breakthroughs = db.Column(db.Text)  # JSON string
    failed_approaches = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'huntId': self.hunt_id,
            'weekNumber': self.week_number,
            'entry': self.entry,
            'breakthroughs': json.loads(self.breakthroughs) if self.breakthroughs else [],
            'failedApproaches': json.loads(self.failed_approaches) if self.failed_approaches else [],
            'createdAt': int(self.created_at.timestamp() * 1000) if self.created_at else None
        }

class HuntNode(db.Model):
    __tablename__ = 'hunt_nodes'
    
    id = db.Column(db.Integer, primary_key=True)
    hunt_id = db.Column(db.Integer, db.ForeignKey('hunts.id'), nullable=False)
    x = db.Column(db.Float, nullable=False)
    y = db.Column(db.Float, nullable=False)
    width = db.Column(db.Float, default=200)
    height = db.Column(db.Float, default=50)
    text = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='note')  # 'note' or 'llm'
    connections = db.Column(db.Text)  # JSON string of connected node IDs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'huntId': self.hunt_id,
            'x': self.x,
            'y': self.y,
            'width': self.width,
            'height': self.height,
            'text': self.text,
            'type': self.type,
            'connections': json.loads(self.connections) if self.connections else [],
            'createdAt': int(self.created_at.timestamp() * 1000) if self.created_at else None,
            'updatedAt': int(self.updated_at.timestamp() * 1000) if self.updated_at else None
        }