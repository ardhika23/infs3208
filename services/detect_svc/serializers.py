from rest_framework import serializers
from .models import Detection, DetectionItem

class DetectionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetectionItem
        fields = ("id","klass","confidence","x","y","w","h")

class DetectionSerializer(serializers.ModelSerializer):
    items = DetectionItemSerializer(many=True, read_only=True)
    class Meta:
        model = Detection
        fields = ("id","filename","file_url","annotated_url","model_version","pod_id",
                  "total_objects","avg_conf","created_at","items")