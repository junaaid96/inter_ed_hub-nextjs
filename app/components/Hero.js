import Link from "next/link";

export default function Hero() {
    return (
        <div className="hero bg-base-100">
            <div className="hero-content text-center p-32">
                <div className="">
                    <h1 className="text-5xl font-bold">
                        Welcome to InterEd Hub
                    </h1>
                    <p className="py-6">
                        Unlock the door to a world of virtual learning
                        excellence with our cutting-edge online school
                        management system. Seamlessly integrate technology with
                        education, empowering educators and students alike to
                        thrive in the digital age.
                    </p>
                    <Link href={"/register"} className="btn btn-primary">Get Started</Link>
                </div>
            </div>
        </div>
    );
}
