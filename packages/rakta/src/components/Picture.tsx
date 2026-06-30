import React, {
	type CSSProperties,
	type HTMLAttributes,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

type ObjectFitValue = "contain" | "cover" | "fill" | "none" | "scale-down";
type LoadingValue = "lazy" | "eager" | "auto";

export interface PictureProps
	extends Omit<
		HTMLAttributes<HTMLPictureElement>,
		"children" | "onError" | "onLoad"
	> {
	path: string;
	alt: string;
	title?: string;
	height?: number;
	width?: number;
	loading?: LoadingValue;
	responsive?: boolean;
	blurDataURL?: string;
	objectFit?: ObjectFitValue;
	priority?: boolean;
	onLoadComplete?: () => void;
	onError?: () => void;
	className?: string;
	style?: CSSProperties;
}

export function Picture({
	path,
	alt,
	title,
	height,
	width,
	blurDataURL,
	onLoadComplete,
	onError,
	className,
	style,
	loading = "lazy",
	responsive = true,
	objectFit = "cover",
	priority = false,
	...rest
}: PictureProps): React.ReactElement {
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);
	const imageRef = useRef<HTMLImageElement>(null);
	const pictureRef = useRef<HTMLPictureElement>(null);

	const resolvedLoading: "lazy" | "eager" = priority
		? "eager"
		: loading === "auto"
			? "lazy"
			: loading;

	useEffect(() => {
		const imageElement = imageRef.current;

		if (imageElement?.complete) {
			setIsLoaded(true);
			onLoadComplete?.();
		}
	}, [onLoadComplete]);

	const handleLoad = useCallback(() => {
		setIsLoaded(true);
		onLoadComplete?.();
	}, [onLoadComplete]);

	const handleError = useCallback(() => {
		setHasError(true);
		onError?.();
	}, [onError]);

	const resolvedPath = hasError && blurDataURL ? blurDataURL : path;
	const resolvedWidth = responsive ? "100%" : (width ?? "auto");

	const wrapperStyle: CSSProperties = {
		position: "relative",
		display: "inline-block",
		overflow: "hidden",
		height: height ?? "auto",
		width: resolvedWidth,
	};

	const imageStyle: CSSProperties = {
		display: "block",
		height: height ?? undefined,
		width: resolvedWidth,
		minHeight: height ?? undefined,
		objectFit,
		transition: blurDataURL ? "filter 0.3s ease" : undefined,
		filter:
			blurDataURL && !isLoaded && !hasError
				? "blur(12px) brightness(1.05)"
				: "none",
		...style,
	};

	if (blurDataURL) {
		return (
			<div
				style={{
					...wrapperStyle,
					backgroundImage: `url(${blurDataURL})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<picture ref={pictureRef} className={className} {...rest}>
					<img
						ref={imageRef}
						src={resolvedPath}
						alt={alt}
						aria-label={alt}
						title={title}
						loading={resolvedLoading}
						decoding={priority ? "sync" : "async"}
						style={imageStyle}
						onLoad={handleLoad}
						onError={handleError}
					/>
				</picture>
			</div>
		);
	}

	return (
		<picture ref={pictureRef} className={className} {...rest}>
			<img
				ref={imageRef}
				src={resolvedPath}
				alt={alt}
				aria-label={alt}
				title={title}
				loading={resolvedLoading}
				decoding={priority ? "sync" : "async"}
				style={imageStyle}
				onLoad={handleLoad}
				onError={handleError}
			/>
		</picture>
	);
}

export default Picture;
