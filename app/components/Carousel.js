"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-cards";
import { useState, useEffect } from "react";
import getAllTeachers from "@/lib/getAllTeachers";
import Link from "next/link";

export default function Carousel() {
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        async function fetchTeachers() {
            const data = await getAllTeachers();
            setTeachers(data);
        }
        fetchTeachers();
    }, []);

    return (
        <Swiper
            navigation
            pagination={{ type: "fraction" }}
            modules={[Navigation, Pagination, EffectCards]}
            grabCursor={true}
            effect="cards"
            onSwiper={(swiper) => console.log(swiper)}
            className="rounded-lg shadow-lg"
        >
            {teachers.map((teacher, index) => (
                <SwiperSlide key={index}>
                    <div className="card card-compact bg-base-100 shadow-xl p-12">
                        <figure>
                            <Image
                                src={teacher.profile_pic}
                                alt={teacher.username}
                                width={300}
                                height={300}
                                className="rounded-lg"
                            />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title">
                                {teacher.first_name} {teacher.last_name}
                            </h2>
                            <p>{teacher.bio}</p>
                            <div className="card-actions justify-end">
                                <Link href={`/teacher/${teacher.id}`} className="btn btn-primary">
                                    View
                                </Link>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
