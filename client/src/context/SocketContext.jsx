import { createContext, useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        // Return a stable empty object if used outside provider (e.g. during hmr)
        return { socket: null, onlineUsers: [] };
    }
	return context;
};

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { currentUser } = useSelector((state) => state.user);

	useEffect(() => {
		if (currentUser) {
			const socket = io("http://localhost:3001", {
				query: {
					userId: currentUser._id,
				},
			});

			setSocket(socket);

            // Emit setup event as requested
            socket.emit("setup", currentUser._id);

			// socket.on() is used to listen to the events. can be used both on client and server side
			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			return () => socket.close();
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [currentUser]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};
