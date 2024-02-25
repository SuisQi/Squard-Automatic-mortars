<script setup lang="js">
import io from "socket.io-client";
import {nextTick, onMounted, ref} from "vue";
import {
  get_settings,
  getState,
  list_fires,
  list_mail_trajectories,
  setMortarRounds,
  setState,
  update_settings
} from "@/api";
import {
  Briefcase,
  Delete,
  Refresh,
  Message,
  Search,
  Star,
} from '@element-plus/icons-vue'
import * as d3 from 'd3';
import BezierCurve from "@/components/BezierCurve.vue";

const isOn = ref(false)
const logs = ref([])
const fires = ref([])
const mortarRounds = ref(3)
const dialogFires = ref(false)
const dialogSetting = ref(false)
const dialogFeature = ref(false)
const mail_trajectories = ref([])
const settings = ref({
  "beforeFire": [0.5,1],
  "afterFire": [0.5,1],
  "mail_gap": 1,
  "orientation_gap": 0.1
})

let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
console.log(viewportWidth)
onMounted(() => {
  init()
  const socket = io(`http://${window.location.hostname}:8080`);
  // const socket = io(`http://192.168.1.103:8080`);
  console.log(socket)
  socket.on("log_message", (message) => {
    logs.value.push(message.data);
    nextTick(() => {
      const container = document.getElementsByClassName("log-container")[0];
      container.scrollTop = container.scrollHeight
    })
  });
  list_mail_trajectories().then(res=>{
    mail_trajectories.value=res.data.data
  })
  setInterval(init, 500)
})
const init = () => {
  getState().then(res => {

    isOn.value = parseInt(res.data.data) === 1
  })
  list_fires().then(res => {
    fires.value = res.data.data
  })
  get_settings().then(res=>{
    settings.value=res.data.data
  })
}
const changeSettings=()=>{
  update_settings({
    ...settings.value
  })
  return true
}
const toggleSwitch = () => {
  setState(!isOn.value).then(res => {
    isOn.value = parseInt(res.data.data) === 1

  })

}
const onMortarRoundsChange = (event) => {
  setMortarRounds(event.target.value)
}
// https://cdn.discordapp.com/avatars/801691645392715787/1ba0e4f36742eafd92a086df0a1de7b1.webp?size=80
// Reaper_17
</script>

<template>
  <div class="w-full h-screen bg-gray-200 flex flex-grow items-center flex-1 ">
    <div
        class="  basis-full  grid grid-cols-2 max-md:grid-cols-1  max-md:grid-rows-3 max-md:gap-0 gap-10 justify-items-center ">

      <div class="flex flex-col items-center max-md:justify-start justify-center gap-3">

        <!-- 查看火力点的按钮 -->

        <el-button @click="dialogFeature=true" type="warning" :icon="Briefcase">功能</el-button>
        <el-dialog
          title="功能"
          :width="viewportWidth*0.9>600?600:viewportWidth*0.9"
          v-model="dialogFeature">
          <div class="w-full flex flex-col gap-4 justify-start items-start">

            <!-- 新增的迫击炮轮数控制块 -->
            <div class="w-full">
              <div class="flex flex-row items-center">
                <label for="mortar-rounds" class="text-gray-700 mr-2">每轮发射数:</label>
                <select id="mortar-rounds" @change="onMortarRoundsChange" v-model="mortarRounds"
                        class="bg-gray-700 text-white p-2 rounded">
                  <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
            </div>

            <el-button class="w-full" @click="()=>dialogFires=true" type="danger">查看火力点</el-button>
            <div></div>
            <el-button class="w-full"  @click="()=>dialogSetting=true" type="info">编辑轨迹点</el-button>
            <div class="w-full grid grid-cols-[100px_auto] gap-2">
              <div class="min-w-[100px]">开火前停顿(s)</div>
              <el-slider class="w-full" v-model="settings.beforeFire" :step="0.1"  range show-stops :max="2" @change="changeSettings"/>
              <div class="min-w-[100px]">开火后停顿(s)</div>
              <el-slider class="w-full" v-model="settings.afterFire" :step="0.1"  range show-stops :max="2" @change="changeSettings" />
              <div>密位最大误差</div>
              <el-input-number
                  v-model="settings.mail_gap"
                  :min="0"
                  :max="10"
                  size="small"
                  controls-position="right"
                  @change="changeSettings"

              />
              <div>方位最大误差</div>
              <el-input-number
                  v-model="settings.orientation_gap"
                  :min="0"
                  :max="10"
                  size="small"
                  controls-position="right"
                  @change="changeSettings"
              />
            </div>


            <div class="flex flex-row w-full items-center">

            </div>
          </div>
        </el-dialog>
        <el-dialog
            v-model="dialogFires"
            title="火力点"
            width="300"
        >
          <el-table :data="fires" stripe style="width: 100%">
            <el-table-column prop="entityId" label="id" width="40"/>
            <el-table-column prop="dir" label="方位"/>
            <el-table-column prop="angle" label="密位"/>


          </el-table>

        </el-dialog>
        <el-dialog
            v-model="dialogSetting"
            title="设置"
            :width="viewportWidth"
        >
          <div class="w-full flex flex-col items-center">
            <BezierCurve v-for="(item,index) in mail_trajectories" :width="viewportWidth*0.9" :height="200" :points="item.points" :name="item.name" :num_points="item.num_points"></BezierCurve>
          </div>
        </el-dialog>
        <div
            class="w-32 h-32 rounded-full flex justify-center items-center cursor-pointer"
            :class="isOn ? 'bg-green-500' : 'bg-blue-500'"
            @click="toggleSwitch"
        >
          <span class="text-white text-2xl">{{ isOn ? '停止' : '启动' }}</span>
        </div>
      </div>
      <div class="p-4 w-full h-full max-md:row-span-2">
        <!--        <h2 class="text-2xl font-bold mb-4 ">日志消息</h2>-->
        <div class="log-container bg-gray-900 p-4 rounded-lg h-[600px] max-md:h-[300px] overflow-auto">
          <ul>
            <li v-for="(log, index) in logs" :key="index" class="text-sm mb-2">
              <span class="text-green-400">{{ log.substring(0, 23) }}</span>
              <span class="text-gray-300">{{ log.substring(23) }}</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

