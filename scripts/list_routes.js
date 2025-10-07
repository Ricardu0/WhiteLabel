import app from '../src/app.js';

function dumpRoutes() {
  if (!app._router) { console.log('no app._router'); return; }
  const out = [];
  app._router.stack.forEach(mw => {
    if (mw.route) {
      const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
      out.push(`${methods} ${mw.route.path}`);
    } else if (mw.name === 'router') {
      out.push(`<router ${mw.regexp}>`);
    } else {
      out.push(`<mw ${mw.name}>`);
    }
  });
  console.log(out.join('\n'));
}

dumpRoutes();
