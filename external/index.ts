// This is a snippet of code that would run in the Discord devTools context.
// This would be native within BetterDiscords api in the future once it is polished enough.
// Yes I know its horrible code... Its supposed to work.

/*
webpackChunkdiscord_app.push([[Symbol("Arven")], {}, (e) => {
    if (typeof e.b == "string") {
        window.n = e;
    }
}]);
    
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
    const result = JSON.parse(event.data);
    let data;
    
    const unescapedQuery = result.query.map(q => 
        q.replace(/\\(.)/g, '$1')
    );
    
    const options = {
        raw: true,
        ...result.options
    };
    
    const ModuleData = Webpack[result.type](...unescapedQuery, options);

    if (result.action === 'openSource') {
        if (ModuleData.length === 0) {
            data = { success: false, error: true, message: "No modules found" };
        } else if (ModuleData.length === 1) {
            const source = String(n.m[ModuleData[0].id]);
            data = { 
                success: true, 
                error: false, 
                message: "Found one unique module", 
                source, 
                id: ModuleData[0].id 
            };
        } else {
            const modules = ModuleData.map(mod => ({
                id: mod.id,
                source: String(n.m[mod.id]),
                exports: Object.keys(mod.exports || {})
            }));
            
            data = { 
                success: true, 
                error: false, 
                message: `Found ${ModuleData.length} modules`, 
                multiple: true,
                modules 
            };
        }
    } else {
        if (ModuleData.length === 0) {
            data = { success: false, error: true, message: "No modules found" };
        } else if (ModuleData.length === 1) {
            data = { 
                success: true, 
                error: false, 
                message: "Found one unique module",
                moduleInfo: {
                    id: ModuleData[0].id,
                    exports: Object.keys(ModuleData[0].exports || {})
                }
            };
        } else {
            data = { 
                success: true, 
                error: false, 
                message: `Found ${ModuleData.length} modules`,
                moduleInfo: ModuleData.map(mod => ({
                    id: mod.id,
                    exports: Object.keys(mod.exports || {})
                }))
            };
        }
    }
    
    ws.send(JSON.stringify(data));
};
*/
