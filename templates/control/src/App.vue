<script setup lang="ts">
import io from "socket.io-client";
import {nextTick, onMounted, ref} from "vue";
import {getState, list_fires, setMortarRounds, setState} from "@/api";

const isOn = ref(false)
const logs = ref([] as Array<string>)
const fires = ref([])
const mortarRounds = ref(3)
const dialogFires = ref(false)
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
  setInterval(init, 500)
})
const init = () => {
  getState().then(res => {

    isOn.value = parseInt(res.data.data) === 1
  })
  list_fires().then(res=>{
    fires.value=res.data.data.map((e:string)=>JSON.parse(e))
  })
}

const toggleSwitch = () => {
  setState(!isOn.value).then(res => {
    isOn.value = parseInt(res.data.data) === 1

  })

}
const onMortarRoundsChange=(event:any)=>{
  setMortarRounds(event.target.value)
}
// https://cdn.discordapp.com/avatars/801691645392715787/1ba0e4f36742eafd92a086df0a1de7b1.webp?size=80
// Reaper_17
</script>

<template>
  <div class="w-full h-screen bg-gray-200 flex flex-grow items-center flex-1 ">
    <div class="  basis-full  grid grid-cols-2 max-md:grid-cols-1  max-md:grid-rows-3 max-md:gap-0 gap-10 justify-items-center ">

      <div class="flex flex-col items-center max-md:justify-start justify-center gap-3">
        <!-- 新增的迫击炮轮数控制块 -->
        <div class="w-full">
          <div class="flex flex-row items-center">
            <label for="mortar-rounds" class="text-gray-700 mr-2">每轮发射数:</label>
            <select id="mortar-rounds" @change="onMortarRoundsChange" v-model="mortarRounds" class="bg-gray-700 text-white p-2 rounded">
              <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
        </div>
        <!-- 查看火力点的按钮 -->
        <el-link @click="()=>dialogFires=true" type="danger">查看火力点</el-link>
        <el-dialog
            v-model="dialogFires"
            title="火力点"
            width="300"
        >
          <el-table :data="fires" stripe style="width: 100%">
            <el-table-column prop="entityId" label="id"  width="40"/>
            <el-table-column prop="angle" label="密位" />
            <el-table-column prop="dir" label="方位"  />

          </el-table>

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

