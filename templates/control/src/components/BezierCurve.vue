<script setup lang="js">
import * as d3 from 'd3';
import {onMounted, ref} from "vue";
import {get_bezier_points, reset_mail_trajectory} from "@/api";
import {
  Plus,
  Delete,
  Refresh,
  Message,
  Search,
  Star,
} from '@element-plus/icons-vue'

const props = defineProps(['width', 'height', 'points', 'name', "num_points"])

const d3Container = ref(null)
const inputs = ref([])
const activeNames = ref(['1'])
const num_points = ref(0)
const drawCurve = () => {
  console.log(d3Container)


  // 绘制曲线
  // let points = inputs.value.map(f => props.height * f * 0.5).map(f => parseInt(f))
  get_bezier_points({
    "name": props.name,
    "width": props.width,
    "height": props.height,
    "points": inputs.value,
    "num_points": num_points.value
  }).then(res => {
    const svg = d3.select(d3Container.value)
        .html('') // 清空容器中的内容
        .append('svg')
        .attr('width', props.width)
        .attr('height', props.height);
    // 定义一个线生成器
    const lineGenerator = d3.line()
        .curve(d3.curveBasis); // 使用基础样条曲线，适合多次贝塞尔曲线
    svg.append('path')
        .datum(res.data.data) // 绑定数据
        .attr('d', lineGenerator) // 使用线生成器定义路径
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .style('transform', `scale(1, -1) translate(0px, -${props.height}px)`);
    // 绘制水平线
    svg.append('line')
        .attr('x1', 0) // 起点x坐标
        .attr('y1', props.height / 2) // 起点y坐标，SVG高度的一半
        .attr('x2', props.width) // 终点x坐标，SVG的宽度
        .attr('y2', props.height / 2) // 终点y坐标，与起点y坐标相同
        .attr('stroke', 'red')
        .attr('stroke-width', 2);
  })


}
onMounted(() => {
  inputs.value = props.points
  num_points.value = props.num_points
  drawCurve()
})
const validateInput = (index) => {
  inputs.value[index]=Number(inputs.value[index])
  // 确保输入为正数，这里简化处理，实际项目中可能需要更严格的验证
  if (inputs.value[index] < 0) {
    inputs.value[index] = 0;
  }

}

const blurInput = (index) => {

  if (!inputs.value[index])
    inputs.value[index] = 0;
  inputs.value[index]=Number(inputs.value[index])
  drawCurve()
}
const validateNumInput = () => {
  // 确保输入为正数，这里简化处理，实际项目中可能需要更严格的验证
  if (!num_points.value)
    return
  if (num_points.value < 2)
    num_points.value = 2;
  // drawCurve()
}
const blurNumInput = () => {

  if (!num_points.value)
    num_points.value = 2;
  num_points.value = parseInt(num_points.value)
  drawCurve()
}

const removeInput = (index) => {
  inputs.value.splice(index, 1);
  drawCurve()
}
const addInput = (index) => {

  if (index === -1) {
    // 如果index为-1，则添加到数组末尾
    inputs.value.push(0.5);
  } else {
    // 否则，插入到指定的index后面
    inputs.value.splice(index + 1, 0, 0.5);
  }
  drawCurve()
}
const refresh_t = () => {
  reset_mail_trajectory({
    name: props.name
  }).then(res => {
    inputs.value = res.data.data.points
    num_points.value = res.data.data.num_points
    drawCurve()
  })
}
</script>

<template>

  <div class="flex w-full flex-col gap-3 items-center">
    <div class="">{{ props.name }}</div>
    <div class="flex flex-row w-full">
      <div class="min-w-[100px]">轨迹点数</div>
      <el-input size="small" @blur='blurNumInput' @input="validateNumInput" v-model="num_points" type="number"/>
    </div>
    <div ref="d3Container"></div>
    <el-collapse v-model="activeNames" class="w-full">
      <el-collapse-item title="编辑轨迹" name="1">
        <div class="flex flex-col gap-2 items-center">

          <div v-for="(input, index) in inputs" :key="index" class="flex flex-row gap-3">

            <el-input v-model="inputs[index]" type="number" @input="validateInput(index)" @blur="blurInput(index)"
                      min="0"/>

            <el-button type="danger" @click="removeInput(index)" :icon="Delete" circle/>
            <el-button type="success" @click="addInput(index)" :icon="Plus" circle/>
          </div>
          <div class="flex flex-row">
            <el-button type="primary" @click="refresh_t" :icon="Refresh">重置</el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

  </div>
</template>

<style scoped>

</style>
