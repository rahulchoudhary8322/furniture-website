async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/categories/tree');
    const json = await res.json();
    console.log('--- API CATEGORIES TREE ---');
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}
run();
