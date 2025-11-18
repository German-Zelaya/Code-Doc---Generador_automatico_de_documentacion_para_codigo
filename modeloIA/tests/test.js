function calculateSum(a, b) {
    return a + b;
}

const multiply = (x, y) => {
    return x * y;
}

async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}