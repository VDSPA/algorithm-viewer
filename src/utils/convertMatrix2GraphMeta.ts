const checkMatrixIsSquare = (matrix: GraphAPI.Matrix) => {
  const height = matrix.length;
  for (let i = 0; i < height; i++) {
    if (matrix?.length !== matrix[i].length) {
      throw new Error(`invalid row at row:${i}`);
    }
  }

  return height;
};

/**
  * Convert a matrix to graphMetaData
  *
  * @return graphMetaData
  * @return null when any error occurs
  *
  */
const convertMatrix2GraphMeta = (matrix: GraphAPI.Matrix) => {
  const nodes: GraphAPI.Node[]  = [];
  const edges: GraphAPI.Edge[]  = [];

  try {
    const edgeLength = checkMatrixIsSquare(matrix);

    for (let i = 0; i < edgeLength; i++) {
      nodes.push({ id: i.toString(), x: 1, y: 1});
    }

    matrix.forEach((row, rowIndex) => {
      row.forEach((item, itemIndex) => {
        if (item > 0) {
          edges.push({
            source: rowIndex.toString(),
            target: itemIndex.toString(),
            value: item
          });
        }
      });
    });

    return {
      nodes,
      edges
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default convertMatrix2GraphMeta;
