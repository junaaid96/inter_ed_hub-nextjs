export default async function getTeacher({ id }) {
    const res = await fetch(`https://inter-ed-hub-drf.onrender.com/teachers/${id}/`);
    const data = await res.json();
    // console.log(data);
    return data;
}
