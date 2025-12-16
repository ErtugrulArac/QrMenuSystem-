import * as React from "react"
import Link from "next/link"

import { IoLogoInstagram } from "react-icons/io5";
import { FaFacebook } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";


import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { GiHamburgerMenu } from "react-icons/gi"

export default function DrawerDemo() {


    return (
        <Drawer>
            <DrawerTrigger asChild>
                <div style={{ position: 'fixed', right: '1rem', bottom: '1.25rem', zIndex: 9999 }} className="bg-black rounded-full p-3"> <GiHamburgerMenu size={30} color="white" /> </div>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Arlan Cafee</DrawerTitle>
                        <DrawerDescription>Güncel işletme bilgilerimiz.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0 flex flex-col gap-3">
                        <div>
                            <h3 className="font-semibold">Çalışma saatlerimiz:</h3>
                            <p>Hafta içi: 09:00 - 22:00</p>
                            <p>Cumartesi: 09:00 - 21:00</p>
                            <p>Pazar: Kapalı</p>
                        </div>
                        <iframe className="w-full" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3060.5559926144606!2d41.270726499999995!3d39.9065722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2628a79910cc9b5f%3A0xd45613ce0f4c8482!2sArlan%20Medya%20-%20Dijital%20Reklam%20Ajans%C4%B1!5e0!3m2!1str!2str!4v1713636241597!5m2!1str!2str" width="300" height="200"  loading="lazy" ></iframe>
                        <div className="flex items-center justify-center gap-2">
                            <IoLogoInstagram size={30}/>
                            <FaFacebook size={30}/>
                            <FaSquareXTwitter size={30}/>
                        </div>
                    </div>
                    <DrawerFooter>
                        <div className="flex gap-3 w-full">
                            <Button className="flex-1"><Link target="_blank" href="https://g.page/r/CYKETA_OE1bUEB0/review">Bize Puan ver</Link></Button>
                            <DrawerClose asChild>
                                <Button variant="outline" className="flex-1">Kapat</Button>
                            </DrawerClose>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
