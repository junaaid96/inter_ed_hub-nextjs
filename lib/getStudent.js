export default async function getStudent(id) {
    const res = await fetch(
        `https://inter-ed-hub-drf.onrender.com/students/${id}/`,
        { cache: "no-store" }
    );
    const data = await res.json();
    return data;
}
