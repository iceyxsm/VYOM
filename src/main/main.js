const { app, BrowserWindow } = require('electron');
const path = require('path');

// Enable hot reload in development mode
// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

if (isDev) {
  // Simple file watcher using Node.js fs.watch
  const fs = require('fs');
  const rendererPath = path.join(__dirname, '../renderer');
  
  console.log('✅ Development mode: Hot reload enabled');
  
  // Watch renderer directory for changes
  fs.watch(rendererPath, { recursive: true }, (eventType, filename) => {
    if (filename && (filename.endsWith('.html') || filename.endsWith('.css') || filename.endsWith('.js'))) {
      console.log(`📝 File changed: ${filename}`);
      // Reload will be handled by the window's watcher below
    }
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in development
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
    
    // Simple file watcher using Node.js fs.watch for hot reload
    const fs = require('fs');
    const rendererPath = path.join(__dirname, '../renderer');
    
    // Watch renderer files for changes
    const watchers = [];
    
    ['index.html', 'styles.css', 'renderer.js'].forEach(file => {
      const filePath = path.join(rendererPath, file);
      try {
        const watcher = fs.watch(filePath, (eventType) => {
          if (eventType === 'change') {
            console.log(`🔄 Reloading due to change in: ${file}`);
            mainWindow.reload();
          }
        });
        watchers.push(watcher);
      } catch (error) {
        console.log(`⚠️  Could not watch ${file}:`, error.message);
      }
    });
    
    // Watch entire renderer directory as fallback
    try {
      const dirWatcher = fs.watch(rendererPath, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.html') || filename.endsWith('.css') || filename.endsWith('.js'))) {
          console.log(`📝 File changed: ${filename}`);
          mainWindow.reload();
        }
      });
      watchers.push(dirWatcher);
    } catch (error) {
      console.log('⚠️  Could not watch renderer directory:', error.message);
    }
    
    // Clean up watchers on window close
    mainWindow.on('closed', () => {
      watchers.forEach(watcher => {
        try {
          watcher.close();
        } catch (e) {
          // Ignore errors when closing
        }
      });
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

