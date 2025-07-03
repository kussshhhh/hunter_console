from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Configure logging to reduce noise
logging.getLogger("sentence_transformers").setLevel(logging.WARNING)

class SemanticClusterer:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """
        Initialize with a lightweight sentence transformer model.
        all-MiniLM-L6-v2 is fast, small (~90MB), and good for semantic similarity.
        """
        try:
            self.model = SentenceTransformer(model_name)
            print(f"Loaded semantic model: {model_name}")
        except Exception as e:
            print(f"Failed to load semantic model: {e}")
            self.model = None
    
    def get_embedding(self, text):
        """Get embedding vector for a single text."""
        if not self.model or not text.strip():
            return None
        
        try:
            # Clean and prepare text
            cleaned_text = text.strip()
            if len(cleaned_text) < 3:  # Skip very short texts
                return None
                
            embedding = self.model.encode([cleaned_text])
            return embedding[0]
        except Exception as e:
            print(f"Error getting embedding: {e}")
            return None
    
    def calculate_similarity(self, text1, text2):
        """Calculate semantic similarity between two texts (0-1 scale)."""
        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)
        
        if emb1 is None or emb2 is None:
            return 0.0
        
        try:
            # Reshape for cosine similarity calculation
            emb1 = emb1.reshape(1, -1)
            emb2 = emb2.reshape(1, -1)
            
            similarity = cosine_similarity(emb1, emb2)[0][0]
            return float(similarity)
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0
    
    def find_best_cluster_position(self, new_text, existing_nodes, similarity_threshold=0.6):
        """
        Find the best position for a new node based on semantic similarity.
        Returns (x, y) coordinates or None if no good cluster found.
        """
        if not existing_nodes or not self.model:
            return None
        
        best_similarity = 0
        best_node = None
        
        for node in existing_nodes:
            if not node.get('text'):
                continue
                
            similarity = self.calculate_similarity(new_text, node['text'])
            
            if similarity > best_similarity and similarity > similarity_threshold:
                best_similarity = similarity
                best_node = node
        
        if best_node:
            # Position near the most similar node with some randomness
            angle = np.random.random() * 2 * np.pi
            distance = 120 + np.random.random() * 80  # 120-200px away
            
            x = best_node['x'] + np.cos(angle) * distance
            y = best_node['y'] + np.sin(angle) * distance
            
            return {
                'x': float(x),
                'y': float(y),
                'similarity': float(best_similarity),
                'related_to': best_node.get('id')
            }
        
        return None
    
    def cluster_existing_nodes(self, nodes, similarity_threshold=0.7):
        """
        Analyze existing nodes and suggest clusters.
        Returns list of node groups that should be clustered together.
        """
        if not nodes or len(nodes) < 2 or not self.model:
            return []
        
        clusters = []
        processed = set()
        
        for i, node1 in enumerate(nodes):
            if i in processed or not node1.get('text'):
                continue
                
            cluster = [node1]
            processed.add(i)
            
            for j, node2 in enumerate(nodes):
                if j <= i or j in processed or not node2.get('text'):
                    continue
                
                similarity = self.calculate_similarity(node1['text'], node2['text'])
                
                if similarity > similarity_threshold:
                    cluster.append(node2)
                    processed.add(j)
            
            if len(cluster) > 1:
                clusters.append({
                    'nodes': cluster,
                    'center': self._calculate_cluster_center(cluster)
                })
        
        return clusters
    
    def _calculate_cluster_center(self, nodes):
        """Calculate the geometric center of a cluster of nodes."""
        if not nodes:
            return {'x': 0, 'y': 0}
        
        total_x = sum(node.get('x', 0) for node in nodes)
        total_y = sum(node.get('y', 0) for node in nodes)
        count = len(nodes)
        
        return {
            'x': total_x / count,
            'y': total_y / count
        }

# Global instance (initialized lazily)
_clusterer = None

def get_clusterer():
    """Get the global semantic clusterer instance."""
    global _clusterer
    if _clusterer is None:
        _clusterer = SemanticClusterer()
    return _clusterer