export default async function getTeacher(id) {
    const res = await fetch(
        `https://inter-ed-hub-drf.onrender.com/teachers/${id}/`,
        { cache: "no-store" }
    );
    const data = await res.json();
    return data;
}
