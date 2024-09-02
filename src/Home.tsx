import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const SERVER_URL = "https://livecode-colaborator.onrender.com";

export default function Home() {
  const [roomId, setRoomId] = useState("");

  const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/contest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const { id } = await response.json();
        const userId = Date.now().toString(36);
        window.location.href = `/room/${id}/${userId}`;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleJoinRoom = async () => {
    try {
      console.log("object");
      const response = await fetch(`${SERVER_URL}/contest/${roomId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      if (response.ok) {
        const userId = Date.now().toString(36);
        window.location.href = `/room/${res.id}/${userId}`;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center  bg-slate-800">
      <div className="my-20">
        <h2 className="text-6xl mb-4 text-slate-50 font-semibold">
          Welcome to LiveCode Collaborator
        </h2>
        <p className="text-2xl text-slate-300">
          LiveCode Collaborator is a web-based collaborative code editor that
          allows you to code in real-time with other developers.
        </p>
      </div>

      <div className="flex justify-start items-center">
        <Button variant="outline" className="mx-4" onClick={handleCreateRoom}>
          Create Room
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Join Room</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enter Room ID</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center space-x-4">
              <Input
                id="name"
                defaultValue="Pedro Duarte"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="col-span-3 flex-grow"
              />
              <Button onClick={handleJoinRoom}>Join Room</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
