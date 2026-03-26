import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";

// 🔑 PEGÁ TUS APIS ACÁ
const ELEVEN_API_KEY = "sk_50f06b4accd6cf12fb2b80d7e52e26ccd61fa31f139565a5";
const OPENAI_KEY = "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";

const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

const chat = document.getElementById("chat");

function addMessage(text, sender) {
  chat.innerHTML += `<div><b>${sender}:</b> ${text}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

// 🧠 IA REAL
async function askAI(msg) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + OPENAI_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres Jarvis, un asistente inteligente. Responde claro y breve." },
        { role: "user", content: msg }
      ]
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}

// 🔊 VOZ REAL
async function speak(text) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVEN_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_multilingual_v2"
    })
  });

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  const audio = new Audio(audioUrl);
  audio.play();
}

// 📤 TEXTO
window.send = async function () {
  const input = document.getElementById("input");
  const msg = input.value;

  addMessage(msg, "Tú");

  const res = await askAI(msg);
  addMessage(res, "Jarvis");

  speak(res);

  input.value = "";
};

// 🎤 VOZ
window.startVoice = function () {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "es-ES";

  recognition.onresult = function (event) {
    const text = event.results[0][0].transcript;
    sendFromVoice(text);
  };

  recognition.start();
};

async function sendFromVoice(text) {
  addMessage(text, "Tú");

  const res = await askAI(text);
  addMessage(res, "Jarvis");

  speak(res);
}

// 🖱️ MOVER
const jarvis = document.getElementById("jarvis");
let isDown = false, offset = [0,0];

jarvis.addEventListener("mousedown", (e)=>{
  isDown = true;
  offset = [jarvis.offsetLeft - e.clientX, jarvis.offsetTop - e.clientY];
});

document.addEventListener("mouseup", ()=> isDown=false);

document.addEventListener("mousemove", (e)=>{
  if(isDown){
    jarvis.style.left = (e.clientX + offset[0]) + "px";
    jarvis.style.top = (e.clientY + offset[1]) + "px";
  }
});

// 🧍‍♂️ 3D
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("avatar"), alpha:true });

renderer.setSize(window.innerWidth, window.innerHeight);

const loader = new GLTFLoader();

loader.load("tu_modelo.glb", function(gltf) {
  scene.add(gltf.scene);
}, undefined, function(error) {
  console.error(error);
});

camera.position.z = 3;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
