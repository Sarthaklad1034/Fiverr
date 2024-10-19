// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import React from "react";
// import { Link, useParams } from "react-router-dom";
// import newRequest from "../../utils/newRequest";
// import "./Message.scss";

// const Message = () => {
//   const { id } = useParams();
//   const currentUser = JSON.parse(localStorage.getItem("currentUser"));

//   const queryClient = useQueryClient();

//   const { isLoading, error, data } = useQuery({
//     queryKey: ["messages"],
//     queryFn: () =>
//       newRequest.get(`/messages/${id}`).then((res) => {
//         return res.data;
//       }),
//   });

//   const mutation = useMutation({
//     mutationFn: (message) => {
//       return newRequest.post(`/messages`, message);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["messages"]);
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     mutation.mutate({
//       conversationId: id,
//       desc: e.target[0].value,
//     });
//     e.target[0].value = "";
//   };

//   return (
//     <div className="message">
//       <div className="container">
//         <span className="breadcrumbs">
//         <Link to="/messages">Messages</Link> &gt; John Doe &gt;
//         </span>
//         {isLoading ? (
//           "loading"
//         ) : error ? (
//           "error"
//         ) : (
//           <div className="messages">
//             {data.map((m) => (
//               <div className={m.userId === currentUser._id ? "owner item" : "item"} key={m._id}>
//                 <img
//                   src="https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=1600"
//                   alt=""
//                 />
//                 <p>{m.desc}</p>
//               </div>
//             ))}
//           </div>
//         )}
//         <hr />
//         <form className="write" onSubmit={handleSubmit}>
//           <textarea type="text" placeholder="write a message" />
//           <button type="submit">Send</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Message;
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Message.scss";

const Message = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isLoading, error, data: messages } = useQuery({
    queryKey: ["messages", id],
    queryFn: () =>
      newRequest.get(`/messages/${id}`).then((res) => {
        return res.data;
      }),
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      const conv = messages[0].conversation;
      setConversation(conv);
    }
  }, [messages]);

  const mutation = useMutation({
    mutationFn: (message) => {
      return newRequest.post(`/messages`, message);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["messages", id], (oldMessages) => {
        return [...oldMessages, data];
      });
      setNewMessage("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      conversationId: id,
      desc: newMessage,
    });
  };

  const otherUser = conversation && (currentUser.isSeller ? conversation.buyer : conversation.seller);

  return (
    <div className="message">
      <div className="container">
        <span className="breadcrumbs">
          <Link to="/messages">Messages</Link> &gt; {otherUser?.username || "Conversation"}
        </span>
        {isLoading ? (
          "Loading..."
        ) : error ? (
          "Error occurred while fetching messages"
        ) : (
          <div className="messages-container">
            {otherUser && (
              <div className="user-info">
                <img src={otherUser.avatar || "/img/noavatar.jpg"} alt={otherUser.username} />
                <h2>{otherUser.username}</h2>
              </div>
            )}
            <div className="messages">
              {messages.map((m) => (
                <div
                  className={`message-item ${
                    m.userId === currentUser._id ? "owner" : ""
                  }`}
                  key={m._id}
                >
                  <div className="message-content">
                    <span className="username">{m.userId === currentUser._id ? "You" : otherUser?.username}</span>
                    <p>{m.desc}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="write" onSubmit={handleSubmit}>
              <textarea
                type="text"
                placeholder="Write a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;