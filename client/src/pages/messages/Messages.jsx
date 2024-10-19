// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import React from "react";
// import { Link } from "react-router-dom";
// import newRequest from "../../utils/newRequest";
// import "./Messages.scss";
// import moment from "moment";

// const Messages = () => {
//   const currentUser = JSON.parse(localStorage.getItem("currentUser"));

//   const queryClient = useQueryClient();

//   const { isLoading, error, data } = useQuery({
//     queryKey: ["conversations"],
//     queryFn: () =>
//       newRequest.get(`/conversations`).then((res) => {
//         return res.data;
//       }),
//   });

//   const mutation = useMutation({
//     mutationFn: (id) => {
//       return newRequest.put(`/conversations/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["conversations"]);
//     },
//   });

//   const handleRead = (id) => {
//     mutation.mutate(id);
//   };

//   return (
//     <div className="messages">
//       {isLoading ? (
//         "loading"
//       ) : error ? (
//         "error"
//       ) : (
//         <div className="container">
//           <div className="title">
//             <h1>Messages</h1>
//           </div>
//           <table>
//             <tr>
//               <th>{currentUser.isSeller ? "Buyer" : "Seller"}</th>
//               <th>Last Message</th>
//               <th>Date</th>
//               <th>Action</th>
//             </tr>
//             {data.map((c) => (
//               <tr
//                 className={
//                   ((currentUser.isSeller && !c.readBySeller) ||
//                     (!currentUser.isSeller && !c.readByBuyer)) &&
//                   "active"
//                 }
//                 key={c.id}
//               >
//                 <td>{currentUser.isSeller ? c.buyerId : c.sellerId}</td>
//                 <td>
//                   <Link to={`/message/${c.id}`} className="link">
//                     {c?.lastMessage?.substring(0, 100)}...
//                   </Link>
//                 </td>
//                 <td>{moment(c.updatedAt).fromNow()}</td>
//                 <td>
//                   {((currentUser.isSeller && !c.readBySeller) ||
//                     (!currentUser.isSeller && !c.readByBuyer)) && (
//                     <button onClick={() => handleRead(c.id)}>
//                       Mark as Read
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Messages;
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Messages.scss";
import moment from "moment";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { isLoading, error, data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => {
        return res.data;
      }),
  });

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  const handleContact = async (userId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const res = await newRequest.post('/conversations', {
        to: userId,
      });
      navigate(`/message/${res.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="messages">
      <div className="container">
        <div className="title">
          <h1>Messages</h1>
        </div>
        {isLoading ? (
          "Loading..."
        ) : error ? (
          "Error occurred while fetching conversations"
        ) : (
          <div className="conversation-list">
            {conversations.map((c) => {
              const otherUser = currentUser.isSeller ? c.buyer : c.seller;
              return (
                <div
                  className={`conversation-item ${
                    ((currentUser.isSeller && !c.readBySeller) ||
                      (!currentUser.isSeller && !c.readByBuyer)) &&
                    "unread"
                  }`}
                  key={c._id}
                >
                  <div className="user-info">
                    <img 
                      src={otherUser.avatar || "/img/noavatar.jpg"} 
                      alt={otherUser.username} 
                    />
                    <div className="user-details">
                      <span className="username">{otherUser.username}</span>
                      <Link to={`/message/${c._id}`} className="last-message">
                        <strong>{c.lastMessage.sender === currentUser._id ? "You: " : `${otherUser.username}: `}</strong>
                        {c.lastMessage.desc.substring(0, 50)}
                        {c.lastMessage.desc.length > 50 ? "..." : ""}
                      </Link>
                    </div>
                  </div>
                  <div className="conversation-actions">
                    <span className="date">{moment(c.updatedAt).fromNow()}</span>
                    {((currentUser.isSeller && !c.readBySeller) ||
                      (!currentUser.isSeller && !c.readByBuyer)) && (
                      <button
                        className="mark-read"
                        onClick={() => handleRead(c._id)}
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      className="contact-button"
                      onClick={() => handleContact(otherUser._id)}
                    >
                      Contact
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;