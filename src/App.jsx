import { use, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { currentMonitor } from '@tauri-apps/api/window';
import "./App.css";

const monitor = currentMonitor();

function App() {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function move_mouse(x=0, y=0, abs=false) {
    try {
      setGreetMsg(await invoke("move_mouse", { x, y, abs}));
    } catch (e) {
      console.log(e);
    }
  }

  useEffect( () => {
    (async function() {
      const theWindow = await monitor;
      console.log(theWindow.size.height, theWindow.size.width);
      setScreenSize(theWindow.size);
    })();
  }, []);

  return (
    <div className="container">
      <h1>Welcome to Tauri + React</h1>
    </div>
  );
}

export default App;
