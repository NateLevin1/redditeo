import {Composition} from 'remotion';
import {HelloWorld} from './HelloWorld';
import './font.css';

export const RemotionVideo: React.FC = () => {
	return (
		<>
			<Composition
				id="helloworld"
				component={HelloWorld}
				durationInFrames={60}
				fps={30}
				width={1080}
				height={1920}
			/>
		</>
	);
};
