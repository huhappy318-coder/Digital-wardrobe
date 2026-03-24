import bpy
import sys
import os

def convert_fbx_to_glb(input_path, output_path):
    try:
        # 清空场景
        bpy.ops.wm.read_factory_settings(use_empty=True)

        # 导入FBX文件
        bpy.ops.import_scene.fbx(filepath=input_path)

        # 确保场景中有物体
        if len(bpy.context.scene.objects) == 0:
            print("Error: No objects imported from FBX file")
            return False

        # 导出为GLB
        bpy.ops.export_scene.gltf(filepath=output_path, format="GLB", export_selected=False)

        print(f"Successfully converted {input_path} to {output_path}")
        return True

    except Exception as e:
        print(f"Error converting {input_path} to {output_path}: {e}")
        return False

if __name__ == "__main__":
    # 项目根目录
    project_dir = os.path.dirname(os.path.abspath(__file__))
    input_dir = os.path.join(project_dir, "frontend", "assets", "models")
    output_dir = os.path.join(project_dir, "frontend", "assets", "models")

    # 确保输出目录存在
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 转换男性模型（X Bot.fbx -> XBot.glb）
    male_input = os.path.join(input_dir, "male.fbx")
    male_output = os.path.join(output_dir, "XBot.glb")
    if os.path.exists(male_input):
        convert_fbx_to_glb(male_input, male_output)
    else:
        print(f"Male model not found: {male_input}")

    # 转换女性模型（Y Bot.fbx -> YBot.glb）
    female_input = os.path.join(input_dir, "female.fbx")
    female_output = os.path.join(output_dir, "YBot.glb")
    if os.path.exists(female_input):
        convert_fbx_to_glb(female_input, female_output)
    else:
        print(f"Female model not found: {female_input}")

    # 检查是否成功创建了模型文件
    if os.path.exists(male_output) and os.path.exists(female_output):
        print("\n✅ Conversion completed successfully!")
        print(f"\nModels saved in: {output_dir}")
        print(f"Files created:")
        print(f"  - XBot.glb")
        print(f"  - YBot.glb")
        print(f"\nPlease restart the server to see the models in the try-on page.")
    else:
        print("\n❌ Conversion failed!")
