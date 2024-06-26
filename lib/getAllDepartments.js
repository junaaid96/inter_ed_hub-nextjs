export default async function getAllDepartments() {
    const res = await fetch(
        "https://inter-ed-hub-drf.onrender.com/departments/",
        { cache: "no-store" }
    );
    const data = await res.json();
    return data;
}
