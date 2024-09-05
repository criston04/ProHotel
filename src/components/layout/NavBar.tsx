"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Container from "../Container";
import Link from "next/link";
import SearchInput from "../SearchInput";
import { ThemeToggle } from "../theme-toggle";
import { NavMenu } from "./NavMenu";

export const NavBar = () => {
  const { userId } = useAuth();
  return (
    <div className="sticky top-0 border border-b-primary/10 bg-secondary z-50 ">
      <Container>
        <div className="flex justify-between">
          <Link
            href="/"
            className="font-black cursor-pointer p-2 text-indigo-600"
          >
            My<span className="">Hotel</span>
          </Link>
          <SearchInput />
          <div className="flex gap-3 items-center ">
            {/*<div>
              <ThemeToggle />
            </div> */}
            
            {userId && (
              <div>
                <NavMenu />
              </div>
            )}

            <UserButton afterSignOutUrl="/" />
            {!userId && (
              <>
                <Link href="/login" className="text-gray-600 text-sm">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-500 p-2 rounded-md text-white text-sm hover:bg-indigo-600 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NavBar;
