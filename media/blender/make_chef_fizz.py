# Blender 5.x script: imports the sculpted multi-material "Fizza (Chef Fizz)" 3D avatar
# (public/models/chef-fizz.glb), sets up 3-point studio lighting & portrait camera,
# saves media/blender/chef-fizz.blend, and renders a verification preview PNG.
#
# Run headless:
#   blender -b -P media/blender/make_chef_fizz.py
import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
GLB_IN = ROOT / "public" / "models" / "chef-fizz.glb"
BLEND_OUT = ROOT / "media" / "blender" / "chef-fizz.blend"
PREVIEW_OUT = ROOT / "docs" / "screenshots" / "avatar-preview.png"

bpy.ops.wm.read_factory_settings(use_empty=True)

# Import the sculpted multi-material GLB (with all 27 materials & 4 animation clips)
bpy.ops.import_scene.gltf(filepath=str(GLB_IN))

# Smooth shading on all imported mesh objects
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True

# Add cute pink studio pedestal
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.48, depth=0.06, location=(0, 0, -0.03))
pedestal = bpy.context.active_object
pedestal.name = "PinkPedestal"
mat_ped = bpy.data.materials.new(name="PedestalPink")
mat_ped.use_nodes = True
bsdf = mat_ped.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs["Base Color"].default_value = (0.95, 0.48, 0.68, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.4
pedestal.data.materials.append(mat_ped)

# World background (soft pastel pink studio backdrop)
world = bpy.data.worlds.new("StudioWorld")
bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs[0].default_value = (0.98, 0.89, 0.93, 1.0)
    bg.inputs[1].default_value = 1.1

# 3-Point Studio Lighting
def add_light(name, ltype, energy, color, loc, rot=(0, 0, 0)):
    ld = bpy.data.lights.new(name=name, type=ltype)
    ld.energy = energy
    ld.color = color
    lo = bpy.data.objects.new(name=name, object_data=ld)
    bpy.context.collection.objects.link(lo)
    lo.location = loc
    lo.rotation_euler = rot
    return lo

add_light("KeyLight", 'SUN', 2.2, (1.0, 0.96, 0.92), (1.8, -3.2, 3.5), (math.radians(55), 0, math.radians(25)))
add_light("FillLight", 'SUN', 1.1, (1.0, 0.92, 0.96), (-2.0, -2.5, 2.2), (math.radians(65), 0, math.radians(-35)))
add_light("RimLight", 'SUN', 1.2, (1.0, 0.70, 0.85), (0.0, 2.8, 2.8), (math.radians(-45), 0, 0))

# Studio Portrait Camera facing front of character (in Blender after glTF import, +Y is back, -Y is front, +Z is up)
cam_data = bpy.data.cameras.new(name="PortraitCam")
cam_data.lens = 55
cam_obj = bpy.data.objects.new(name="PortraitCam", object_data=cam_data)
bpy.context.collection.objects.link(cam_obj)
cam_obj.location = (0.0, -2.85, 0.92)
cam_obj.rotation_euler = (math.radians(88), 0.0, 0.0)
bpy.context.scene.camera = cam_obj

# Save genuine Blender 5.3 .blend file
BLEND_OUT.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_OUT))

# Render verification preview image via Cycles CPU
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 24
scene.cycles.use_denoising = False
scene.render.resolution_x = 640
scene.render.resolution_y = 760
scene.render.filepath = str(PREVIEW_OUT)
bpy.ops.render.render(write_still=True)

print(f"Saved Blender file: {BLEND_OUT} and rendered preview: {PREVIEW_OUT}")
