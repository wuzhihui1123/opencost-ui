import React, { useEffect, useState } from "react";
import { get, round } from "lodash";
import { makeStyles } from "@material-ui/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Typography from "@material-ui/core/Typography";
import AllocationChart from "./AllocationChart";
import { toCurrency } from "../util";

const useStyles = makeStyles({
  noResults: {
    padding: 24,
  },
});

function descendingComparator(a, b, orderBy) {
  if (get(b, orderBy) < get(a, orderBy)) {
    return -1;
  }
  if (get(b, orderBy) > get(a, orderBy)) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: "name", numeric: false, label: "Name", width: "auto" },
  { id: "cpuCost", numeric: true, label: "CPU Cost", width: 90 },
  { id: "ramCost", numeric: true, label: "RAM Cost", width: 90 },
  { id: "cpuEfficiency", numeric: true, label: "CPU Efficiency", width: 130 },
  { id: "ramEfficiency", numeric: true, label: "RAM Efficiency", width: 130 },
  { id: "totalCost", numeric: true, label: "Total Cost", width: 90 },
  { id: "totalEfficiency", numeric: true, label: "Total Efficiency", width: 130 },
];

const AllocationReport = ({
  allocationData,
  cumulativeData,
  totalData,
  currency,
}) => {
  const classes = useStyles();

  if (allocationData.length === 0) {
    return (
      <Typography variant="body2" className={classes.noResults}>
        No results
      </Typography>
    );
  }

  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("totalCost");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const numData = cumulativeData.length;

  useEffect(() => {
    setPage(0);
  }, [numData]);

  const lastPage = Math.floor(numData / rowsPerPage);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const createSortHandler = (property) => (event) =>
    handleRequestSort(event, property);

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === "desc";
    setOrder(isDesc ? "asc" : "desc");
    setOrderBy(property);
  };

  const orderedRows = stableSort(cumulativeData, getComparator(order, orderBy));
  const pageRows = orderedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div id="report">
      <AllocationChart
        allocationRange={allocationData}
        currency={currency}
        n={10}
        height={300}
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((cell) => (
                <TableCell
                  key={cell.id}
                  colSpan={cell.colspan}
                  align={cell.numeric ? "right" : "left"}
                  sortDirection={orderBy === cell.id ? order : false}
                  style={{ width: cell.width }}
                >
                  <TableSortLabel
                    active={orderBy === cell.id}
                    direction={orderBy === cell.id ? order : "asc"}
                    onClick={createSortHandler(cell.id)}
                  >
                    {cell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((row, key) => {
              let cpuEfficiency = round(row.cpuEfficiency * 100, 1);
              let ramEfficiency = round(row.ramEfficiency * 100, 1);
              let totalEfficiency = round(row.totalEfficiency * 100, 1);
              return (
                <TableRow key={key}>
                  <TableCell align="left">{row.name}</TableCell>
                  <TableCell align="right">
                    {toCurrency(row.cpuCost, currency)}
                  </TableCell>
                  <TableCell align="right">
                    {toCurrency(row.ramCost, currency)}
                  </TableCell>
                  <TableCell align="right">{cpuEfficiency}%</TableCell>
                  <TableCell align="right">{ramEfficiency}%</TableCell>
                  <TableCell align="right">
                    {toCurrency(row.totalCost, currency)}
                  </TableCell>
                  <TableCell align="right">{totalEfficiency}%</TableCell>

                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={numData}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50,100,200,500,1000]}
        page={Math.min(page, lastPage)}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default React.memo(AllocationReport);
