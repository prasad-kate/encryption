function Home() {
  // const { receiveMessage, sendMessage } = useCrypto();
  return (
    <div>
      <button
        onClick={() => {
          console.log("get key");
        }}
      >
        GET Encryption key
      </button>
    </div>
  );
}

export default Home;
