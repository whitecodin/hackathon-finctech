import app from '../supabase-server.ts';

const port = Number(process.env.PORT || 3001);
app.listen(port, '127.0.0.1', () => {
  console.log('Supabase API ready on http://127.0.0.1:' + port);
});
