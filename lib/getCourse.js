export default async function getCourse(id) {
    const res = await fetch(
        `https://inter-ed-hub-drf.onrender.com/courses/${id}/`,
        { cache: "no-store" }
    );
    const data = await res.json();
    // console.log(data);
    return data;
}
