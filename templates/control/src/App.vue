<script setup lang="js">
import io from "socket.io-client";
import {nextTick, onMounted, ref} from "vue";
import {
  get_settings,
  getControl,
  list_fires,
  list_trajectories,
  setMortarRounds,
  setControl,
  update_settings
} from "@/api";
import QrcodeVue from 'qrcode.vue';
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

const isOn = ref(false) //开火控制
const showOnlyMe = ref(true) //是否只显示自己的火力点
const synergy = ref(false) //开火控制
const logs = ref([])
const fires = ref([])
const mortarRounds = ref(3)
const mortarRoundsSelectList = ref([])
const dialogFires = ref(false)
const dialogSetting = ref(false)
const dialogOrigentationSetting = ref(false)
const dialogFeature = ref(false)
const mail_trajectories = ref([])
const origentation_trajectories = ref([])
const settings = ref({
  "beforeFire": [0.5,1],
  "afterFire": [0.5,1],
  "mail_gap": 1,
  "orientation_gap": 0.1
})

let viewportWidth = ref(window.innerWidth);
let viewportHeight = window.innerHeight;
let host = ref(window.location.hostname)
console.log(viewportWidth)
onMounted(() => {
  init()
  for (let i = 0; i < 9; i++) {
    mortarRoundsSelectList.value.push({
      value:i+1,
      label:"每轮发射"+(i+1)+"炮"
    })
  }
  mortarRoundsSelectList.value.push({
    value:999,
    label:"一直砸"
  })
  const socket = io(`http://${host.value}:8080`);
  // const socket = io(`http://192.168.1.103:8080`);
  console.log(socket)
  socket.on("log_message", (message) => {
    logs.value.push(message.data);
    nextTick(() => {
      const container = document.getElementsByClassName("log-container")[0];
      container.scrollTop = container.scrollHeight
    })
  });
  list_trajectories("mail").then(res=>{
    mail_trajectories.value=res.data.data
  })
  list_trajectories("orientation").then(res=>{
    origentation_trajectories.value=res.data.data
  })

  setInterval(init, 500)
})
const init = () => {
  viewportWidth.value = window.innerWidth;

  getControl({type:"state"}).then(res => {

    isOn.value = parseInt(res.data.data) === 1
  })
  getControl({type:"synergy"}).then(res => {

    synergy.value = parseInt(res.data.data) === 1
  })
  list_fires(showOnlyMe.value?1:0).then(res => {
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
  setControl({
    state:!isOn.value?1:0,

  }).then(res => {
    isOn.value = parseInt(res.data.data.state) === 1

  })
}
const set_synergy=(synergy)=>{
  setControl({

    synergy:synergy?1:0
  })

}
const onMortarRoundsChange = (value) => {
  setMortarRounds(value)
}
// https://cdn.discordapp.com/avatars/801691645392715787/1ba0e4f36742eafd92a086df0a1de7b1.webp?size=80
// Reaper_17
</script>

<template>
  <div class="w-full h-screen bg-gray-200 flex flex-grow items-center flex-1 ">
    <div class="w-full flex flex-col items-center gap-4" v-if="viewportWidth>480" >
      <qrcode-vue :value="`http://${host}:5173`" :size="500"></qrcode-vue>
      <div><span class="text-blue-600">保持手机和电脑在同一局域网且关闭防火墙</span> 使用微信或者浏览器扫描该二维码</div>
      <div class="text-red-400">如果还扫不出就手机开热点电脑连接</div>
    </div>
    <div v-else
        class="  basis-full  grid grid-cols-2 max-md:grid-cols-1  max-md:grid-rows-3 max-md:gap-0 gap-10  ">

      <div class="flex flex-col items-center max-md:justify-start justify-center gap-3">

        <!-- 查看火力点的按钮 -->


        <div class="grid grid-cols-2 gap-1 justify-center">
          <!-- 新增的迫击炮轮数控制块 -->
          <el-select
              v-model="mortarRounds"
              placeholder="Select"
              size="large"
              @change="onMortarRoundsChange"
          >

            <el-option
                v-for="item in mortarRoundsSelectList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />

          </el-select>
          <el-button  @click="()=>dialogFires=true" type="danger">查看火力点</el-button>

          <el-switch
              v-model="synergy"
              active-text="协同开火"
              inactive-text="单独开火"
              @change="set_synergy"
          />
          <el-button @click="dialogFeature=true" type="warning" :icon="Briefcase">功能</el-button>
        </div>
        <el-dialog
          title="功能"
          :width="viewportWidth*0.9>600?600:viewportWidth*0.9"
          v-model="dialogFeature">


          <div class="w-full flex flex-col gap-4 justify-start items-start">




            <div></div>
            <el-button class="w-full"  @click="()=>dialogSetting=true" type="info">编辑密位轨迹点</el-button>
            <div></div>
            <el-button class="w-full"  @click="()=>dialogOrigentationSetting=true" type="info">编辑方位轨迹点</el-button>
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
          <div class="flex flex-row ">
            <div class="只显示自己"></div>
            <el-switch v-model="showOnlyMe" active-text="只显示自己"
                       inactive-text="整个房间"/>
          </div>
          <el-table :data="fires" stripe style="width: 100%">
            <el-table-column prop="entityId" label="id" width="40"/>
            <el-table-column prop="dir" label="方位"/>
            <el-table-column prop="angle" label="密位"/>


          </el-table>

        </el-dialog>
        <el-dialog
            v-model="dialogSetting"
            title="密位轨迹设置"
            :width="viewportWidth"
        >
          <div class="w-full flex flex-col items-center"  >
            <BezierCurve v-for="(item,index) in mail_trajectories"  type="mail" :width="viewportWidth*0.9" :height="200" :points="item.points" :name="item.name" :num_points="item.num_points"></BezierCurve>
          </div>
        </el-dialog>
        <el-dialog
            v-model="dialogOrigentationSetting"
            title="方位轨迹设置"
            :width="viewportWidth"
        >
          <div class="w-full flex flex-col items-center" >
            <BezierCurve v-for="(item,index) in origentation_trajectories" type="orientation" :width="viewportWidth*0.9" :height="200" :points="item.points" :name="item.name" :num_points="item.num_points"></BezierCurve>
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
              <span class="text-green-400">{{ log.substring(0, 13) }}</span>
              <span class="text-gray-300">{{ log.substring(13) }}</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

