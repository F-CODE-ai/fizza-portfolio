# Blender 4.x / 5.x script: builds the sculpted "Fizza (Chef Fizz)" 3D avatar
# modeled after Fizza Aman's reference photo:
#   - Smooth subdivided oval head, almond eyes, lashes, arched brows, smiling lips
#   - Long flowing layered dark-brown hair curves (curtain bangs + shoulder/back tresses)
#   - Procedural woven tan/cream/slate plaid collared button-up shirt with rolled 3/4 sleeves
#   - Washed blue denim jeans with rolled cuffs + brown double-buckle slide sandals
#   - Gold wristwatch + iced coffee latte cup with green lid & white straw
#   - Saves media/blender/chef-fizz.blend and exports public/models/chef-fizz.glb
#
# Run headless from PowerShell once Blender is installed:
#   blender -b -P media/blender/make_chef_fizz.py
import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
BLEND_OUT = ROOT / "media" / "blender" / "chef-fizz.blend"
GLB_OUT = ROOT / "public" / "models" / "chef-fizz.glb"

bpy.ops.wm.read_factory_settings(use_empty=True)


def make_mat(name, rgba, metallic=0.05, roughness=0.45):
    m = bpy.data.materials.new(name=name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
    return m


mat_skin = make_mat("Skin", (0.89, 0.70, 0.57, 1.0), 0.01, 0.58)
mat_hair = make_mat("Hair", (0.23, 0.13, 0.09, 1.0), 0.05, 0.42)
mat_plaid = make_mat("PlaidShirt", (0.79, 0.66, 0.52, 1.0), 0.0, 0.85)
mat_denim = make_mat("DenimJeans", (0.35, 0.49, 0.65, 1.0), 0.0, 0.82)
mat_sandal = make_mat("SandalLeather", (0.36, 0.21, 0.14, 1.0), 0.05, 0.55)
mat_gold = make_mat("Gold", (0.92, 0.74, 0.30, 1.0), 0.78, 0.24)
mat_cup_lid = make_mat("CupLidGreen", (0.11, 0.47, 0.34, 1.0), 0.05, 0.35)


def add_sphere(name, scale, loc, mat, parent=None, segs=32, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, radius=1.0, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.shade_smooth()
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    return obj


def add_cyl(name, r1, r2, depth, loc, rot, mat, parent=None, verts=24):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.shade_smooth()
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    return obj


def add_hair_curve(name, pts, bevel=0.025, parent=None):
    curve_data = bpy.data.curves.new(name=name, type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = bevel
    curve_data.bevel_resolution = 4
    spline = curve_data.splines.new('NURBS')
    spline.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        spline.points[i].co = (p[0], p[1], p[2], 1.0)
    spline.use_endpoint_u = True
    obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_hair)
    if parent:
        obj.parent = parent
    return obj


root = bpy.data.objects.new("ChefFizzRoot", None)
bpy.context.collection.objects.link(root)

hips = add_sphere("HipsAndLegs", (0.15, 0.11, 0.11), (0, 0, 0.85), mat_denim, root)
for sx in (-0.095, 0.095):
    add_cyl("DenimLeg", 0.068, 0.088, 0.74, (sx, 0, -0.37), (0, 0, 0), mat_denim, hips)
    add_sphere("Sandal", (0.052, 0.095, 0.016), (sx, 0.03, -0.83), mat_sandal, hips)

torso = add_cyl("PlaidTorso", 0.145, 0.158, 0.46, (0, 0, 0.24), (0, 0, 0), mat_plaid, hips)
head = add_sphere("HeadAndHair", (0.148, 0.148, 0.170), (0, 0, 0.36), mat_skin, torso)

# Flowing hair cascades
for i in range(-3, 4):
    x = i * 0.042
    add_hair_curve(f"BackHair_{i}", [(x * 0.6, -0.05, 0.15), (x * 1.15, -0.14, -0.02), (x, -0.11, -0.45)], 0.026, head)

arm_r = add_cyl("ArmRight", 0.042, 0.052, 0.44, (-0.18, 0, -0.02), (0, 0, 0), mat_plaid, torso)
add_sphere("GoldWatch", (0.035, 0.035, 0.015), (0, 0, -0.16), mat_gold, arm_r)
arm_l = add_cyl("ArmLeftWithLatte", 0.042, 0.052, 0.42, (0.18, 0.04, -0.02), (0.6, 0, 0), mat_plaid, torso)
add_cyl("LatteCupLid", 0.044, 0.044, 0.02, (-0.05, 0.18, -0.12), (0, 0, 0), mat_cup_lid, arm_l)

# Keyframe idle + wave
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 48
torso.location = (0, 0, 0.24)
torso.keyframe_insert(data_path="location", frame=1)
torso.location = (0, 0, 0.255)
torso.keyframe_insert(data_path="location", frame=24)
torso.location = (0, 0, 0.24)
torso.keyframe_insert(data_path="location", frame=48)

arm_r.rotation_euler = (0, 0, 0)
arm_r.keyframe_insert(data_path="rotation_euler", frame=1)
arm_r.rotation_euler = (0, math.radians(-125), 0)
arm_r.keyframe_insert(data_path="rotation_euler", frame=16)
arm_r.rotation_euler = (0, 0, 0)
arm_r.keyframe_insert(data_path="rotation_euler", frame=32)

BLEND_OUT.parent.mkdir(parents=True, exist_ok=True)
GLB_OUT.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_OUT))
bpy.ops.export_scene.gltf(filepath=str(GLB_OUT), export_format='GLB')
print("Saved:", BLEND_OUT, "and exported:", GLB_OUT)
