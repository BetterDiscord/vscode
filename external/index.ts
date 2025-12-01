// This is a snippet of code that would run in the Discord devTools context.
// This would be native within BetterDiscords api in the future once it is polished enough.
// Yes I know its horrible code... Its supposed to work.

/*
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
    const result = JSON.parse(event.data);
    let data;
    
    const ModuleData = Webpack.getAllByKeys(result.query, { raw: true });
    if (result.action === 'openSource') {
        if (ModuleData.length === 1) {
            const source = String(n.m[ModuleData[0].id]);
            data = { success: true, error: false, message: "Found one unique module", source };
        } else if (ModuleData.length > 1) {
            data = { success: true, error: false, message: "Found many modules! Please be more unique" };
        } else {
            data = { success: true, error: false, message: "You managed to find none?" };
        }
    } else {
        if (ModuleData.length === 1) {
            data = { success: true, error: false, message: "Found one unique module" };
        } else if (ModuleData.length > 1) {
            data = { success: true, error: false, message: "Found many modules! Please be more unique" };
        } else {
            data = { success: true, error: false, message: "You managed to find none?" };
        }
    }
    
    ws.send(JSON.stringify(data));
};
*/