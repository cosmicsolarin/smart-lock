"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  const showSession = () => {
    if (status === "authenticated") {
      return (
        <>
          {" "}
          <button
            className="border border-solid border-black rounded-lg bg-white text-black p-4"
            onClick={() => {
              signOut({ redirect: false }).then(() => {
                router.push("/");
              });
            }}
          >
            Sign Out
          </button>
          <Link
            href={"/profiles"}
            className="bg-white rounded-lg text-black p-4"
          >
            Profiles
          </Link>
        </>
      );
    } else if (status === "loading") {
      return <span className="text-[#888] text-sm mt-7">Loading...</span>;
    } else {
      return (
        <Link
          href="/login"
          className="border border-solid border-black rounded"
        >
          Sign In
        </Link>
      );
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-xl">Home</h1>
      <div className="flex w-96 justify-around items-center">
        {" "}
        {showSession()}
      </div>
    </main>
  );
}
