// import React, { useEffect, useState } from "react";
// import "./Pay.scss";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
// import newRequest from "../../utils/newRequest";
// import { useParams } from "react-router-dom";
// import CheckoutForm from "../../components/checkoutForm/CheckoutForm";

// const stripePromise = loadStripe(
//   "paste your public key"
// );

// const Pay = () => {
//   const [clientSecret, setClientSecret] = useState("");

//   const { id } = useParams();

//   useEffect(() => {
//     const makeRequest = async () => {
//       try {
//         const res = await newRequest.post(
//           `/orders/create-payment-intent/${id}`
//         );
//         setClientSecret(res.data.clientSecret);
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     makeRequest();
//   }, []);

//   const appearance = {
//     theme: 'stripe',
//   };
//   const options = {
//     clientSecret,
//     appearance,
//   };

//   return <div className="pay">
//     {clientSecret && (
//         <Elements options={options} stripe={stripePromise}>
//           <CheckoutForm />
//         </Elements>
//       )}
//   </div>;
// };

// export default Pay;
import React, { useEffect, useState } from "react";
import "./Pay.scss";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import newRequest from "../../utils/newRequest";
import { useParams } from "react-router-dom";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";

const stripePromise = loadStripe(
  "paste your public key"
);

const Pay = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const createOrder = async () => {
      try {
        const res = await newRequest.post(`/orders/${id}`);
        setOrderId(res.data._id);
      } catch (err) {
        console.log(err);
      }
    };
    createOrder();
  }, [id]);

  useEffect(() => {
    if (orderId) {
      const makeRequest = async () => {
        try {
          const res = await newRequest.post(
            `/orders/create-payment-intent/${orderId}`
          );
          setClientSecret(res.data.clientSecret);
        } catch (err) {
          console.log(err);
        }
      };
      makeRequest();
    }
  }, [orderId]);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return <div className="pay">
    {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
  </div>;
};

export default Pay;