export default async function getAllTeachers() {
    const res = await fetch("https://inter-ed-hub-drf.onrender.com/teachers/", {
        cache: "no-store",
    });
    const data = await res.json();
    return data;
}
