// this is a loading spinner component with 3D rotating orbits
"use client";

export default function LoadingSpinner() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin3D {
            from {
              transform: rotate3d(.5,.5,.5, 360deg);
            }
            to{
              transform: rotate3d(0deg);
            }
          }

          .spinner-box {
            width: 300px;
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: transparent;
          }

          .leo {
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
          }

          .blue-orbit {
            width: 165px;
            height: 165px;
            border: 1px solid #91daffa5;
            animation: spin3D 3s linear .2s infinite;
          }

          .green-orbit {
            width: 120px;
            height: 120px;
            border: 1px solid #91ffbfa5;
            animation: spin3D 2s linear 0s infinite;
          }

          .red-orbit {
            width: 90px;
            height: 90px;
            border: 1px solid #ffca91a5;
            animation: spin3D 1s linear 0s infinite;
          }

          .white-orbit {
            width: 60px;
            height: 60px;
            border: 2px solid #ffffff;
            animation: spin3D 10s linear 0s infinite;
          }

          .w1 {
            transform: rotate3D(1, 1, 1, 90deg);
          }

          .w2 {
            transform: rotate3D(1, 2, .5, 90deg);
          }

          .w3 {
            transform: rotate3D(.5, 1, 2, 90deg);
          }
        `
      }} />
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#1d2630' 
      }}>
        <div className="spinner-box">
          <div className="blue-orbit leo"></div>
          <div className="green-orbit leo"></div>
          <div className="red-orbit leo"></div>
          <div className="white-orbit w1 leo"></div>
          <div className="white-orbit w2 leo"></div>
          <div className="white-orbit w3 leo"></div>
        </div>
      </div>
    </>
  );
}
