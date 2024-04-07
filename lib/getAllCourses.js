export default async function getAllCourses() {
    const res = await fetch("https://inter-ed-hub-drf.onrender.com/courses/", {
        cache: "no-store",
    });
    const data = await res.json();
    return data;
}
