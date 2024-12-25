import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { currentMonitor } from '@tauri-apps/api/window';
import { register } from '@tauri-apps/plugin-global-shortcut';
import "./App.css";

const monitor = currentMonitor();

function App() {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  async function move_mouse(x=0, y=0, abs=false) {
    try {
      setGreetMsg(await invoke("move_mouse", { x, y, abs}));
    } catch (e) {
      console.log(e);
    }
  }

  async function hideWindow() {
    try {
      await invoke("hide_window");
    } catch (e) {
      console.log(e);
    }
  }

  useEffect( () => {
    (async function() {
      await register('CommandOrControl+Shift+Space', async () => {
        console.log('Shortcut triggered');
        await invoke("show_window");
      });

      const theWindow = await monitor;
      console.log(theWindow);
      setScreenSize(theWindow.size);
    })();
  }, []);

  return (
    <div className="container" onClick={hideWindow}>
      <h1>Welcome to Tauri + React</h1>
    </div>
  );
}

export default App;
